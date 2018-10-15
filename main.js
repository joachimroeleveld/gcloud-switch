const inquirer = require('inquirer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getAccounts() {
  const { stdout } = await exec('gcloud auth list --format="json"');

  return JSON.parse(stdout)
    .map(item => item.account)
}

async function askAccount() {
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    console.log('No accounts available');
    process.exit();
  }

  return (await inquirer.prompt([
    {
      type: 'list',
      name: 'account',
      message: 'Select an account',
      choices: accounts
    }
  ])).account;
}

async function setAccount(account) {
  await exec(`gcloud config set account ${account}`);
}

async function getProjects() {
  const { stdout } = await exec(`gcloud projects list --format=json`);

  return JSON.parse(stdout)
    .map(item => ({
      name: item.name,
      value: item.projectId,
    }))
}

async function askProject() {
  const projects = await getProjects();

  if (projects.length === 0) {
    console.log('No projects available');
    process.exit();
  }
  if (projects.length === 1) {
    console.log(`Selecting project (${projects[0]})`)
    return projects[0];
  }

  return (await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Select a project',
      choices: projects
    }
  ])).project;
}

async function setProject(project) {
  await exec(`gcloud config set project ${project}`);

  process.exit();
}

getAccounts()
  .then(askAccount)
  .then(setAccount)
  .then(getProjects)
  .then(askProject)
  .then(setProject);