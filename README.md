# 404-links

> A light link checker, no more broken link in your quality project documentation. (support only markdown)

## Table of Contents

- [About the Project](#about)
- [Github Action](#github-action)
- [Gitlab CI](#gitlab-ci)
- [API](#api-http-server-version)

## About

A part of a good developer experience is to ensure that the documentation is accurate.
Since our repositories depends on different website to get additional detail the 404-links command will support you the validate all the links includes in your documentation.

**The developer experience (DX) is definetly a part of the Product Quality assurance**

You can run the command from different way:
- node
- docker
- Rest API
- github actions
- gitlab CI

### Customer variable

You can customize the script by adding the 2 arguments:

* `path`: to target a specific folder (default: `.`)
* `ignore`: to ignore some url, need to be separated by a coma. example: https://test.local,https://google.com (default: null)

The command with arguments should look like:

```
$ 404-links . "https://google.com,http://my-test.io"
```

## Github Action

If you want to use the script on github action:

1. Create a new file in your repository : `.github/workflows/action.yml`
2. Copy paste the informations in your `action.yml`:

```
name: 404 links

on: [push]

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: 'restqa-404-links'
      uses: restqa/404-links@1.0.0
```

or if you want to pass arguments

```
name: 404 links

on: [push]

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: 'restqa-404-links'
      uses: restqa/404-links@1.0.0
      with:
        path: 'docs'
        ignore: 'http://google.com'
```

## Gitlab CI

If you want to use the script on gitlabCI:

1. Create a new file in your repository : `.gitlab-ci.yml`
2. Copy paste the informations in your `.gitlab-ci.yml`:

```
stages:
  - validator

404-links:
  stage: validator
  image:
    name: 'restqa/404-links:1.0.0'
  script:
    - '404-links .'
#   - '404-links ./docs "https://google.com"' # if you want to add arguments
```

## Api (http server version)

A server version exposing a http rest API is also available.

> The http server version only works with opensource repository url

To start it you can run the command:

```
$ npm run serve
```

The default port is `8080`

If you want to use docker run :

```
$ docker run -e PORT=8000 restqa/404-links npm run serve
```

Then the api `POST /repo` is exposes with the JSON request body :
```
{
  "repository": "https://github.com/sindresorhus/awesome-nodejs",
  "ignore": ["https://github.com/isomorphic-git/isomorphic-git"]
}
```

example: 

```
curl --request POST \
  --url http://localhost:8000/repo \
  --header 'content-type: application/json' \
  --data '{
	  "repository": "https://github.com/sindresorhus/awesome-nodejs",
	  "ignore": ["https://github.com/isomorphic-git/isomorphic-git"]
  }'
```

The response body will just share an array of broken links.
If there is no broken links the array will be empty.

## License

[MIT License](./LICENSE)
