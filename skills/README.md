# Skills

Skills are focused agent capabilities. A skill should be portable, explicit about inputs/outputs, and safe to run. Runtime registration uses `@open-codesign/core` extensibility contracts.

Recommended structure:

```text
skills/<id>/
  SKILL.md
  manifest.json
  references/
  assets/
```

Skills do not receive implicit network/process access. Capabilities declare permissions and the host decides what is granted.
