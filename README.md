# Cobertura action

![](https://github.com/5monkeys/cobertura-action/workflows/Test/badge.svg)

GitHub Action which parse a [XML cobertura report](http://cobertura.github.io/cobertura/) and display the metrics in a GitHub Pull Request.

Many coverage tools can be configured to output cobertura reports:

* [coverage.py](https://coverage.readthedocs.io/en/latest/cmd.html#xml-reporting)
* [Istanbul](https://istanbul.js.org/docs/advanced/alternative-reporters/#cobertura)
* [Maven](https://www.mojohaus.org/cobertura-maven-plugin/)
* [simplecov](https://github.com/colszowka/simplecov/blob/master/doc/alternate-formatters.md#simplecov-cobertura)

## How it looks like

![alt text](img/comment.png "Pull request comment with metrics")

## Inputs

### `repo_token` **Required**

The GITHUB_TOKEN. See [details](https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret).

### `path`

The to the cobertura report. Defaults to `coverage.xml`.

### `skip_covered`

If files with 100% coverage should be ignored. Defaults to `true`.

### `minimum_coverage`

The minimum allowed coverage percentage as an integer.

### `show_line`

Show line rate as specific column.

### `show_branch`

Show branch rate as specific column.

### `show_class_names`

Show class names instead of file names.

## Example usage

```yaml
on:
  pull_request:
    types: [opened]
    branches:
      - master
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: 5monkeys/cobertura-action@master
        with:
          path: src/test.xml
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          minimum_coverage: 75
```
