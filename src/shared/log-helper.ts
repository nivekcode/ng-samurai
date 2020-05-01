import * as chalk from 'chalk';
import * as boxen from 'boxen';

export function logWelcomeMessage() {
  console.log(
    boxen(
      `
  _ __   __ _       ___  __ _ _ __ ___  _   _ _ __ __ _(_)
 | '_ \\ / _\` |_____/ __|/ _\` | '_ \` _ \\| | | | '__/ _\` | |
 | | | | (_| |_____\\__ \\ (_| | | | | | | |_| | | | (_| | |
 |_| |_|\\__, |     |___/\\__,_|_| |_| |_|\\__,_|_|  \\__,_|_|
        |___/                                             
 ` +
        chalk.blue(
          `
                    /\\
  /vvvvvvvvvvvv \\--------------------------------------,
  \`^^^^^^^^^^^^ /====================================="
            \\/
    `
        ),
      { padding: 2, borderColor: 'blue' }
    )
  );
}

export function logError(error: string) {
  console.log(`${chalk.blue('Ng-samurai: ')} ${chalk.red(error)}`);
}
