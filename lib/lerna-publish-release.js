const simpleGit = require('simple-git');
const yargs = require('yargs');
const { spawn } = require("child_process");

const git = simpleGit();
const argv = yargs.argv;

const run = argv => new Promise( (resolve, reject) => {
    const cmd = argv.join(' ');
    console.log(`Running ${cmd}`);
    const child = spawn(cmd, {stdio: 'inherit', shell: true,});
    child.on('exit', (code) => {
        if (code > 0) {
            console.log(`exit with ${code}`);
            reject(code);
        }
        resolve(code);
    });
});

const task = async () => {
    const { latest: {comment, author} } = await git.log({ '-1': true,  'format': { comment: '%B', author: '%aN'}});
    const tags = comment
        .split('\n')
        .filter(line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/))
        .map( line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/)[1]);
    console.log('tags', tags);
    if (tags.length > 0) {
        const gitTagTasks = tags
            .map(tag => {
                console.log('Tagging', tag);
                return git.tag([tag]);
            });
        await Promise.all(gitTagTasks);
        await run(['git', 'push', '--tag', ...tags]);
        await run(['lerna', 'publish', ...argv._]);
    }
    console.log('Done');
};

task();