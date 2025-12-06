# CONTRIBUTION GUIDE

## requirement

- bun > 1.3

## contributing setup

- fork and clone the repo from `git clone https://github.com/<your-username>/sketchy_io.git `
- add upstream `git remote add upstream https://github.com/Roshan-anand/sketchy_io.git`


## setup & installation

- run ` make install ` in root to install all the dependency
- terminal 1 : ` cd web ` && ` bun dev ` to run ui in port `3001`
- terminal 2 : ` cd server ` && ` bun dev ` to run server in port `3000`

## raising a PR

- make separate branch for each individual feature that you work on.
- before adding or commiting changes run ` make check ` in root to lint and format your code to project standards.
- add, commit, push your code changes & raise the PR