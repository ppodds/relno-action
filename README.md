<!-- PROJECT SHIELDS -->

[<div align="center"> ![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![Issues][issues-shield]][issues-url]
[![Issues Closed][issues-closed-shield]</div>][issues-closed-url]

<br />

<!-- PROJECT LOGO -->

![release-note](https://socialify.git.ci/ppodds/release-note/image?description=1&font=KoHo&name=1&owner=1&pattern=Circuit%20Board&theme=Light)

<br />
<div align="center">
<p align="center">
    <a href="#getting-started"><strong>Explore Usage »</strong></a>
    <br />
    <br />
    <a href="docs/index.md">Documentation</a>
    ·
    <a href="https://github.com/ppodds/release-note/issues">Report Bug</a>
    ·
    <a href="https://github.com/ppodds/release-note/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## Screenshots

![screenshot](docs/screenshot.png)

## About The Project

`release-note` ia a fully configurable release note generation framework. Allow you to automatically generate a beautiful release note from commit messages and pull requests.

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

Change your repository default pull request title format. You can find it in `Settings` -> `General` -> `Pull Requests` on GitHub repository page.

![repository setting](docs/pr_default_message.png)

> **Note:** `release-note` use pull request title to generate release note. So you need to change your repository default pull request title format and make sure your pull request title follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Setup config file

Create a `release-note.json` file in your project root directory.

```json
{
  "template": "template.md",
  "prTypes": [
    { "identifier": "feat", "title": "🚀 Enhancements" },
    { "identifier": "fix", "title": "🩹 Fixes" },
    { "identifier": "docs", "title": "📖 Documentation" },
    { "identifier": "chore", "title": "🏡 Chore" },
    { "identifier": "refactor", "title": "💅 Refactors" },
    { "identifier": "test", "title": "✅ Tests" }
  ]
}
```

`template` is the template file path. We will use this file to generate the release note. `prTypes` is the pull request type configuration. `identifier` is the pull request type identifier. `title` is the pull request type title which would be generated. According above config, if you have a pull request with title `feat: add new feature`, the generated title would be `🚀 Enhancements`

Then, create a `template.md` file in your project root directory.

```markdown
## 📝 Changelog

[compare changes]({{ compareUrl }})
%% changes %%

### {{ title }}

%% commits %%

- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ toSentence(message) }} (#{{ prNumber }})
%% commits %%
%% changes %%
<!-- Generate by Release Note -->
```

You might notice that there are some special syntax in the template file. `{{ }}` is the expression syntax. `release-note` would replace it with the specified variable or macro, even a string literal. `%% %%` is the section tag syntax. `release-note` need this to know where the content should be inserted.

### Install release-note

Now, you can add `release-note` to your release workflow.

```yaml
name: Release
on:
  release:
    types: [published, edited]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: ppodds/release-note@v0.0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

Create a new release, and you will get your beautiful release note. 🚀

<!-- ROADMAP -->

## Roadmap

- [ ] Plugin system
- [ ] Fully configurable

See the [open issues](https://github.com/ppodds/release-note/issues)
for a full list of proposed features (and known issues).

<!-- LICENSE -->

## License

Distributed under the MIT License. See
[LICENSE](https://github.com/ppodds/release-note/blob/master/LICENSE)
for more information.

<!-- CONTACT -->

## Contact

### Contributors

<a href="https://github.com/ppodds/release-note/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ppodds/release-note" />
</a>

[contributors-shield]: https://img.shields.io/github/contributors/ppodds/release-note.svg?style=for-the-badge
[contributors-url]: https://github.com/ppodds/release-note/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ppodds/release-note.svg?style=for-the-badge
[forks-url]: https://github.com/ppodds/release-note/network/members
[stars-shield]: https://img.shields.io/github/stars/ppodds/release-note.svg?style=for-the-badge
[stars-url]: https://github.com/ppodds/release-note/stargazers
[issues-shield]: https://img.shields.io/github/issues/ppodds/release-note.svg?style=for-the-badge
[issues-url]: https://github.com/ppodds/release-note/issues
[issues-closed-shield]: https://img.shields.io/github/issues-closed/ppodds/release-note.svg?style=for-the-badge
[issues-closed-url]: https://github.com/ppodds/release-note/issues?q=is%3Aissue+is%3Aclosed
[license-shield]: https://img.shields.io/github/license/ppodds/release-note.svg?style=for-the-badge
[license-url]: https://github.com/ppodds/release-note/blob/master/LICENSE
