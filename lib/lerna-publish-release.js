const simpleGit = require('simple-git');
const yargs = require('yargs');
const { exec } = require("child_process");

const git = simpleGit();

const child_process = require("child_process")
function systemSync(cmd){
    child_process.exec(cmd, (err, stdout, stderr) => {
        console.log('stdout is:' + stdout)
        console.log('stderr is:' + stderr)
        console.log('error is:' + err)
    }).on('exit', code => console.log('final exit code is', code))
}

const task = async () => {
    const { latest: {comment, author} } = await git.log({ '-1': true,  'format': { comment: '%B', author: '%aN'}});
    const gitTagTasks = comment
        .split('\n')
        .filter(line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/))
        .map( line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/)[1])
        .map(tag => {
            console.log('Tagging', tag);
            return git.tag([tag]);
        });
    await Promise.all(gitTagTasks);
    console.log('Pushing tags')
    await git.pushTags();

    const argv = yargs.argv;
    const cmd = ['lerna', 'publish', ...argv._].join(' ');
    systemSync(cmd);
};

task();