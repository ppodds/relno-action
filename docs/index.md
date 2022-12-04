# Documentation

## Basic Knowledge

### How do `release-note` work?

`release-note` will read the commit message of pull request from the git log, and then generate a release note based on the configuration file. It **rely on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**, so you should follow the specification to write your commit message, or it will not work.

> **Note**: We will allow you to set how to parse the commit message in the future, but now we only support [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Configuration

### `release-note.json`

`template`

type: `string`  
required: yes

The path to your template file.

`prTypes`

type: `{ "identifier": string, "title": string }[]`  
required: yes

Define which pull request should be included in the release note and how to generate the title.

## Template Syntax

### Expression

Syntax: `{{ expression }}`

Examples:

```
{{ title }}
{{ "Hello World" }}
{{ toSentence("this is a sentence") }}
```

You can use expression in your template file to generate the release note.

Expression could be:

- string literal
  - `"Hello World"`
  - `'Hello World'`
- variable (change in different context)
  - `compareUrl` (in default context)
  - `title` (in changes section)
  - `message` (in commits section)
- macro
  - `toSentence("this is a sentence")`
  - `toSentence(generateIfNotEmpty(notEmpty, "this is a sentence"))`

#### Grammer

```
expression -> string | macro | variable
string -> '[^'\n]*' | "([^"\n]*)"
macro -> [A-Za-z0-9]+\([^\n]*\)
variable -> [A-Za-z0-9]+
```

### Section Tag

Syntax: `%% section %%` (need two tags to define a section)

Examples:

```
%% changes %%
This is a changes section.
%% changes %%
```

You can use section tag to define a section in your template file.

Available sections:

- `default`
  - `changes`
    - `commits`

> **Note**: `default` section is not a real section, it is the default context of the template file. You can not use it like this: `%% default %%`.

## Macros and Variables

### Micros

#### toSentence

Signature: `toSentence(str: string)`

Convert a string to a sentence.

Examples:

```typescript
toSentence("this is a sentence"); // This is a sentence.
toSentence("test"); // Test
```

#### toTitle

Signature: `toTitle(str: string)`

Convert a string to a title.

Examples:

```typescript
toTitle("this is a title"); // This Is  A Title.
toTitle("test"); // Test
```

#### generateIfNotEmpty

Signature: `generateIfNotEmpty(toBeCheck: string, content: string)`

Generate content if the string is not empty.

Examples:

```typescript
generateIfNotEmpty("", "test"); // generate nothing
generateIfNotEmpty("a", "test"); // test
```

#### generateIfEmpty

Signature: `generateIfNotEmpty(toBeCheck: string, content: string)`

Generate content if the string is empty.

Examples:

```typescript
generateIfNotEmpty("", "test"); // test
generateIfNotEmpty("a", "test"); // generate nothing
```

### Variables

If the variable is not defined in the context and you use it, it will throw an error. If `release-note` can't get the value of the variable, it will use an empty string instead.

#### Default Context

- `authorLogin`
  - therelease author's login (username)
- `authorName`
  - the release author's name (set in GitHub profile)
  - if the user has not set the name, it will be an empty string
- `authorEmail`
  - the release author's email
  - is an empty string most of the time
- `createdAt`
  - the release created time
- `discussionUrl`
  - the release discussion url
- `htmlUrl`
  - the release html url (GitHub release page)
  - e.g. `https://github.com/ppodds/release-note/releases/tag/v0.0.1-alpha.1`
- `id`
  - the action id of the triggered workflow
- `name`
  - release name
  - it could be an empty string
- `publishedAt`
  - the release published time
- `tagName`
  - the release tag name
- `fromVersion`
  - the version which the release is from
- `tarballUrl`
  - the release tarball url
- `targetCommitish`
  - the release target commitish
- `zipballUrl`
  - the release zipball url
- `compareUrl`
  - the release compare url
  - e.g. `https://github.com/ppodds/release-note/compare/v0.0.1-alpha.1...v0.0.1-alpha.2`

#### Changes Context

- `title`
  - same as `title` which set in `prTypes`
- `identifier`
  - same as `identifier` which set in `prTypes`

#### Commits Context

- `hash`
  - commit hash
- `parents`
  - commit parents hash (separated by `" "`)
- `date`
  - commit date
- `message`
  - commit message (without other information)
  - e.g. `docs: a test (#1)` => `a test`
- `refs`
  - commit refs (separated by `" "`)
- `body`
  - commit body
- `commiterName`
  - commiter name
  - if you merge a pull request on GitHub, `commiterName` will be `GitHub`
- `commiterEmail`
  - commiter email
  - if you merge a pull request on GitHub, `commiterEmail` will be `noreply@github.com`
- `authorName`
  - author name (set in git config)
- `authorEmail`
  - author email (set in git config)
- `prType`
  - pull request type (extracted from commit message)
  - e.g. `docs: a test (#1)` => `docs`
- `prSubtype`
  - pull request subtype (extracted from commit message)
  - e.g. `docs(test): a test (#1)` => `test`
- `prNumber`
  - pull request number (extracted from commit message)
  - e.g. `docs: a test (#1)` => `1`

## Frequently Asked Questions

### How do `release-note` know when to update the release note?

`release-note` will check the release body to see if it contains `<!-- Generate by Release Note -->`. If it contains this comment, it will not update the release body. It means you can edit the release body manually after the release note is generated. This is useful when you want to add some extra information in the specify release.

> **Note**: If you want to update the release note, you need to remove the comment.
> **Note**: We might make the comment configurable in the future.

### Action failed with `unknown revision or path not in the working tree` error

This error is caused by `actions/checkout` action. You need to add `fetch-depth: 0` to the `actions/checkout` action. `actions/checkout` will only fetch the commit which triggered the workflow by default. If you want to get the whole commit tree, you need to set `fetch-depth` manually. See [actions/checkout](https://github.com/actions/checkout).

```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0
```
