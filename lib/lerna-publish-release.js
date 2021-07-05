const chalk = require('chalk');
const simpleGit = require('simple-git');
const { spawn } = require("child_process");

const git = simpleGit();

const run = (name, argv) => new Promise((resolve, reject) => {
    const cmd = argv.join(' ');
    console.log(chalk.magenta(`${name}: spawning`), cmd);
    const child = spawn(cmd, { shell: true });
    child.stdout.on('data', (data) => console.log(`${name}: ${data}`));
    child.stderr.on('data', (data) => console.error(chalk.red(`${name}: ${data}`)));
    child.on('exit', (code) => {
        if (code > 0) {
            console.error(chalk.red(`${name}: error ${code}`));
            reject(code);
        } else {
            console.log(chalk.green(`${name}: done`))
            resolve(code);
        }
    });
});

const lernaPublishRelease = async () => {
    const { latest: {comment, author} } = await git.log({ '-1': true,  'format': { comment: '%B', author: '%aN'}});
    const tags = comment
        .split('\n')
        .filter(line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/))
        .map( line => line.match(/\- +([^\/ ]+\/[^@ ]+@[^ \n\r]+)[\n\r]*$/)[1]);
    if (tags.length > 0) {
        await Promise.all(tags.map(tag => run(`tagging ${tag}`, ['git', 'tag', tag])));
        await run('pushing tags', ['git', 'push', 'origin', '--tag']);
        await run('publish release', ['lerna', 'publish', 'from-package', '--yes']);
    } else {
        throw Error('nothing to publish');
    }
};

module.exports = lernaPublishRelease;