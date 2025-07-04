# 404-links - Github Action

<img src="https://user-images.githubusercontent.com/4768226/213418408-53263fc6-c416-4722-908f-3fb4f70744e8.png" width="100%" />

> The only Github Action that will open pull request review when a broken link has been found in one of your markdown documentation.

## Table of Contents

- [About the Project](#about)
- [Github Action](#github-action)

## About

A part of a good developer experience is to ensure that the documentation is accurate.
Since most of the repositories depend on different website to get additional detail.
This Github action will support you to validate all the links includes in your documentation.

**Apply the world in class link checker for your documentation**

## Example

![Screen Recording 2566-01-22 at 10 44 15 PM-min (1)](https://user-images.githubusercontent.com/4768226/213925247-db448675-5256-4e11-b471-82a6e4fcd584.gif)


### Summary

![image](https://user-images.githubusercontent.com/4768226/213923247-14cc9d16-671f-4784-8547-fae97a357a28.png)

### Creation of Pull Request Review

![Example](https://user-images.githubusercontent.com/4768226/213660645-280a62bc-9132-4a99-9df1-3e81a647c4fe.png)

## Versions

* [3.1.6](https://github.com/restqa/404-links) (current version)
* [3.1.5](https://github.com/restqa/404-links/tree/3.1.5)
* [3.1.4](https://github.com/restqa/404-links/tree/3.1.4)
* [3.1.3](https://github.com/restqa/404-links/tree/3.1.3)
* [3.1.2](https://github.com/restqa/404-links/tree/3.1.2)
* [3.1.1](https://github.com/restqa/404-links/tree/3.1.1)
* [3.1.0](https://github.com/restqa/404-links/tree/3.1.0)
* [2.2.0](https://github.com/restqa/404-links/tree/2.2.0)
* [2.2.0](https://github.com/restqa/404-links/tree/2.2.0)
* [1.0.1](https://github.com/restqa/404-links/tree/1.0.1)

## Github Action

If you want to use the script on github action:

1. Create a new file in your repository : `.github/workflows/markdown-lint.yml`
2. Copy paste the informations in your `.github/workflows/markdown-lint.yml`:

```yaml
name: Markdown lint

on:
  push:
    branches: [ master ]
  pull_request:
    types: [assigned, opened, synchronize, reopened]

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: 'restqa-404-links'
      uses: restqa/404-links@3.1.6
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## How to quiclkly ignore a link

If you want to quickly ignore a link, you can add simply add the `<!-- no-check -->` comment right after your link.

Here an example:

```markdown
[https://this-is-a-broken-link.com](https://this-is-a-broken-link.com) <!-- no-check -->
```

## Customize the linting

In order to customize the linter, you will need to create a `.404-links.yml` configuration file at the root level of your project.
Then you can add the following options into the file:

```yaml
folder: docs/ # The folder that required to be parsed
httpsOnly: true # If you want enforce only HTTPS links
pullRequestReview: true # If you want a nice review in your pull requests
ignore: 
  urls: # Array of url to ignore
    - https://github.com 
    - https://broken/* # wildcard allows
  files: # Array of markdown file the shouldn't parse
    - ./test.md # Relative path from the folder shared above
delay:
  'https://gitlab.com': 500 # Perform a pause of 500ms at each call matching the url
```

### Options

| property          | required | type.          | description                                                    | Default |
| ----------------- |  ------- | -------------- | -------------------------------------------------------------- | ------- |
| folder            | No       | string         | The folder that need to be parsed by the github action         | .       |
| httpsOnly         | No       | boolean        | Define all the links SHOULD be HTTPS                           | false   |
| pullRequestReview | No       | boolean        | Activate the pull request review creation when error are found | true    |
| ignore.urls       | No       |  array<string> | List of url to ignore                                          |         |
| ignore.files      | No       |  array<string> | List of file to ignore during the scanning                     |         |
| delay.            | No       | object         | Delay to apply on a domain to avoid rate limits                |         |


## Contribution Development

In order to run the code locally you can
* Install the dependencies: `npm i`
* Run the test `npm test`

## Author

- [@olivierodo](https://www.github.com/olivierodo) - 🇫🇷

## License

[MIT License](./LICENSE)

### References

* [RestQA](https://www.restqa.io)

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
