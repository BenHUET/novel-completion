# novel-completion

![Screenshot_20250211_130732](https://github.com/user-attachments/assets/058a81a2-cccc-468f-97ca-c515443e279a)

A user-friendly LLM web-interface specialized in story completions.

# Usage

Use the `use chat completion` toggle to switch between the two modes below.

## `/api/v1/completions` mode

This mode provides raw completion of your story by the LLM. It produces better prose but is harder to steer when requesting long completions.

Note that this mode is becoming legacy, and support may be limited. If you're using OpenRouter, some providers, might support it while others may not, even for the same model.

## `/api/v1/chat/completions` mode

This mode functions like a chat, where the user and the assistant respond to each other. Outputs may feel more structured but are easier to steer.

### `<inst>`, `<sys>/<dev>`

In this mode, you can use `<inst>your instructions here</inst>` for story instructions and `<sys>system instructions here</sys>` for system-level guidance.

- `<inst>` translates to a message with `role: 'user'`.
- `<sys>` translates to a message with `role: 'system'`.
- `<dev>` translates to a message with `role: 'developer'`.

These tags are automatically omitted when using the `/api/v1/completions` mode, allowing seamless switching between the two modes without manual adjustments.

# Backends

## OpenRouter
* Models selection
* Providers selection and ordering
* Reasoning
* Providers supported parameters

![Screenshot_20250211_130604](https://github.com/user-attachments/assets/f2a43aaf-1fa6-4be6-a845-082384c91556)
![Screenshot_20250211_130635](https://github.com/user-attachments/assets/f73b2b2e-9685-4753-af26-300240ea767e)

## OpenAI
* gpt 3.5
* gpt 4
* o1

## Planned
* OpenAI compatible API

# Get started

```bash
git clone https://github.com/BenHUET/novel-completion.git
npm install
ng serve
```
