---
title: Introducing Lunaria
excerpt: Lunaria is a complete localization management toolchain built especially for open-source projects. Currently, Lunaria is already being used in production to help track over 5000 content files in over a dozen of locales in big projects such as [Astro](https://i18n.docs.astro.build/), [Starlight](https://i18n.starlight.astro.build/), [SolidJS](https://docs.solidjs.com/i18n-status/), and [VitePress](https://vitepress.dev/_translations/).
date: 2024-05-28
authors:
  name: Yan Thomas
  title: Maintainer
  picture: https://avatars.githubusercontent.com/u/61414485
  url: https://github.com/yanthomasdev/
---

Maintaining a project for an international audience is no easy task!

It is a lot of effort to build a sustainable workflow for content to be progressively and consistently localized, especially if you also have contributors to your project.

Lunaria is a complete **localization management toolchain** built especially for open-source projects.

Lunaria is already being used in production to help track over 5,000 content files in over a dozen locales in big projects such as [Astro](https://i18n.docs.astro.build/), [Starlight](https://i18n.starlight.astro.build/), [SolidJS](https://docs.solidjs.com/i18n-status/), and [VitePress](https://vitepress.dev/_translations/).

:::tip[Ready to get started?]
Read the official ["Getting Started" guide](https://lunaria.dev/getting-started/) to learn more about and set up Lunaria in your project.
:::

## Why Lunaria?

While making the Astro documentation available for translation, we noticed how hard it was to build a sustainable workflow for both maintainers and contributors. Most localization management platforms (the ones that help you keep track of and update localizations) force you to give up control of your content and require some sort of paid subscription. More importantly, your international contributors have to learn their platform too, if it is even available in their country.

Wanting a truly free, open-source solution that integrated seamlessly into the translators' and maintainers' normal workflow, the Astro maintainer [`@hippotastic`](https://github.com/hippotastic) built a tailor-made translation tracking tool. The community contributors used this to organize and mobilize, translating the official Astro documentation into 14 different languages with ease.

Lunaria is the evolution of that custom-tailored tool, with a wider scope, more features, and support for different types of projects—fun fact, Lunaria was first hinted at in the ["How Astro does i18n" blog post](https://astro.build/blog/astro-i18n/#going-forward)!

## What's in the "toolchain"?

Lunaria is a _toolchain_: a set of tools that **supercharge your localization workflow** by integrating with several parts of your project's infrastructure, including your repository's Git history, your project's file structure, and development platform such as GitHub or GitLab.

As of today, the toolchain includes:

- A **custom tracking system** that keeps track of your source and localized content changes powered by Git, including a runtime API you can use to build upon.
- A **complete and easy-to-read status dashboard** you can share with contributors and maintainers.
- **Official integrations**, such as a [GitHub Action](https://lunaria.dev/integrations/github-action/) and dashboard integration with the [Starlight documentation theme for Astro](https://lunaria.dev/integrations/starlight/).

And this list is only going to grow soon as we add additional tools to complement our core features.

## First public release

Today marks the release of Lunaria v0.1. This minor release means that Lunaria is ready to be tested and used in production. I also encourage feedback and would love to learn about _your_ use cases so that Lunaria can mature into an even better project.

Additionally, the officially supported [Lunaria GitHub Action](https://lunaria.dev/integrations/github-action/) and the [Lunaria integration for Starlight](https://lunaria.dev/integrations/starlight/) are also receiving their own v0.1 releases as of today.

:::caution[Beta software]
Missing features, bugs, and breaking changes are still expected in this early stage across all officially maintained packages. If you find anything wrong or unexpected, please [open an issue on GitHub](https://github.com/yanthomasdev/lunaria/issues/new/choose)!
:::

## Onward

Lunaria is—and will continue to be—**free and open-source software** (FOSS). You don't need to sign up, and and you don't need to give up ownership of your content to another platform. Lunaria's sole goal is to help you make the world more inclusive, accessible, and globalized.

In response to your feedback, Lunaria will receive constant updates with bug fixes, improvements, and brand-new features. Join the community in brainstorming how Lunaria can shape up to be even better in the future -- and believe me, there are lots of exciting ideas being cooked up!

## Support

Maintaining an open-source project is a lot of work, especially when you're an unemployed and broke college student from Latin America. Fortunately, I've been lucky to have received support from [Astro](https://astro.build/) to dedicate some of my time to Lunaria these past months and bring it to its current state.

If your company or project uses Lunaria, supporting development through [GitHub Sponsors](https://github.com/sponsors/yanthomasdev) will help guarantee its long-term maintenance, and even better, allow me to live sustainably while working full-time on open-source.

As a final -- and quite personal -- aside, Lunaria is the first open-source project and package I wrote and led. To build something like this in public is, to be quite honest, frightening. For all those understanding and kind enough to test it and share your constructive feedback, thank you!
