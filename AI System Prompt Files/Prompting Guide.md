# Prompting Guide

> This guide helps you (the user) ask for features, changes, or fixes in a clear and structured way—so I (the assistant) can implement them efficiently and correctly.

---

## Overview

You don’t need to use technical language to request changes. Just describe what you want clearly. I’ll translate it into code, explain the approach, and document the results.

---

## How to Ask for a Feature

Include as many of the following details as you can:

- **What you want built** (e.g. "a slash command menu in the editor")
- **Where it belongs** (e.g. "when you type '/' inside a block")
- **How it should behave** (e.g. "shows formatting options and converts the block type")
- **Any references** you want me to follow (e.g. "like Notion")

You can format this like:

```
Feature Request: Add a formatting toolbar
Location: When text is highlighted inside the editor
Behavior: Show a floating toolbar with bold/italic/link options
Like: Similar to Notion's floating toolbar
```

---

## How to Ask for a Change or Fix

If something doesn’t look right or doesn’t work how you expected:

- Point out the **specific issue**
- Mention the **file or component** (if you know it)
- Suggest a **preferred outcome**

Example:

```
The floating toolbar appears too far from selected text. Can we adjust its position to sit directly above the selection?
```

---

## Requesting New Components

If you want a new UI element or interaction:

- Describe its purpose
- Mention where it will live or how it’s triggered
- List the expected props or options (if known)

Example:

```
Component Request: BlockMenu
Use: Allows changing a block’s type via a slash command
Trigger: Typing '/' in an empty block
Options: Heading 1, Heading 2, Paragraph, Bullet List
```

---

## Describing Styles

You can use everyday language to describe how something should look. Examples:

- "Make this sidebar look more modern"
- "Use a light theme with dark text"
- "Can this button be more compact and centered?"

---

## Best Practices

- Be clear about the purpose of your request
- Include context if it relates to a specific flow or feature
- Feel free to sketch or link visuals if that helps explain your idea
- Ask questions any time—I'll guide you through options
