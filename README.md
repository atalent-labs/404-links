# 404-links

> A light link checker, no more broken link in your quality project documentation. (support only markdown)

## Table of Contents

- [About the Project](#about)
- [Github Action](#github-action)

## About

A part of a good developer experience is to ensure that the documentation is accurate.
Since most of the repositories depend on different website to get additional detail.
This Github action will support you to validate all the links includes in your documentation.

**The developer experience (DX) should be a part of the Product Quality Assurance**

## Versions

* [2.0.0](https://github.com/restqa/404-links) (current version)
* [1.0.1](https://github.com/restqa/404-links/tree/1.0.1)

## Github Action

If you want to use the script on github action:

1. Create a new file in your repository : `.github/workflows/markdown-lint.yml`
2. Copy paste the informations in your `.github/workflows/markdown-lint.yml`:

```
name: Markdown lint

on: [push]

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: 'restqa-404-links'
      uses: restqa/404-links@v2.0.0
```

## Customize the linting

In order to customize the linter, you will need to create a `.404-links.yml` configuration file at the root level of your project.
Then you can add the following options into the file:

```yaml
folder: docs/ # The folder that required to be parsed
ignore: 
  urls: # Array of url to ignore
    - https://github.com 
    - https://broken/* # wildcard allows
  files: # Array of markdown file the shouldn't parse
    - ./test.md # Relative path from the folder shared above
```

### Do you know RestQA ? 

RestQA is an open automation framework based on Gherkin.
A few step and your Test automation framework is setup. No dependency the framework is ready to be plug to all your project components
[Give a try](https://github.com/restqa/restqa) 🚀

### References

* [RestQA](https://www.restqa.io)
* [RestQA Organization](https://github.com/restqa)

### Keywords

* test automation
* Gherkin
* Cucumber
* End to End
* E2E
* Quality assurance
* QA
* Continuous integration
* RestQa


## License

[MIT License](./LICENSE)
