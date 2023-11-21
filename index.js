const inquirer = require('inquirer');
const _ = require('lodash');
const fs = require('fs');

let questionsstore = [];
try {
  questionsstore = JSON.parse(fs.readFileSync('questionstore.json', 'utf8'));
} catch (error) {
  console.error('error loading questions store:', error.message);
  process.exit(1);
}

function selectquestionsforpaper(difficultydistribution, totalmarks) {
  const groupedquestions = _.groupBy(questionsstore, 'difficulty');
  let selectedquestions = [];

  _.forEach(difficultydistribution, (percentage, difficulty) => {
    const availablequestions = groupedquestions[difficulty] || [];
    const marksfordifficulty = Math.floor(totalmarks * (percentage / 100));
    let currentmarks = 0;

    for (const question of availablequestions) {
      if (currentmarks + question.marks <= marksfordifficulty) {
        selectedquestions.push(question);
        currentmarks += question.marks;
      }
      if (currentmarks >= marksfordifficulty) break;
    }
  });

  return selectedquestions;
}

function generatequestionpaper(totalmarks, difficultydistribution) {
  const selectedquestions = selectquestionsforpaper(difficultydistribution, totalmarks);
  let papertext = 'Question Paper\n\n';

  selectedquestions.forEach(question => {
    papertext += `Question: ${question.question} (Marks: ${question.marks})\n`;
  });

  const totalselectedmarks = _.sumBy(selectedquestions, 'marks');
  papertext += `\nTotal Marks: ${totalselectedmarks}`;

  console.log(papertext);
  fs.writeFileSync('generatedquestionpaper.txt', papertext);
  console.log('Question paper generated successfully!');
}

inquirer.prompt([
  {
    type: 'number',
    name: 'totalmarks',
    message: 'Enter total marks for the question paper:',
    default: 100,
    validate: value => value > 0 ? true : 'Please enter a valid number greater than zero.'
  },
  {
    type: 'number',
    name: 'easypercentage',
    message: 'Enter the percentage of easy questions:',
    default: 20,
    validate: value => value >= 0 && value <= 100 ? true : 'Please enter a valid percentage between 0 and 100.'
  },
  {
    type: 'number',
    name: 'mediumpercentage',
    message: 'Enter the percentage of medium questions:',
    default: 50,
    validate: value => value >= 0 && value <= 100 ? true : 'Please enter a valid percentage between 0 and 100.'
  },
  {
    type: 'number',
    name: 'hardpercentage',
    message: 'Enter the percentage of hard questions:',
    default: 30,
    validate: value => value >= 0 && value <= 100 ? true : 'Please enter a valid percentage between 0 and 100.'
  }
]).then(answers => {
  const { totalmarks, easypercentage, mediumpercentage, hardpercentage } = answers;
  const difficultydistribution = {
    Easy: easypercentage,
    Medium: mediumpercentage,
    Hard: hardpercentage
  };

  generatequestionpaper(totalmarks, difficultydistribution);
});
