### Interaction rules

- Create a work plan and todo list before starting a task, and start work after user confirmation (using human-in-the-loop tool)

  ```Example

  Work Policy: "Work Policy" Todo 1.

  Todo 1. "Specific task 1"\n 2. "Specific task 2"\n 3. "Specific task 3"
  ```

- Check with users if anything is unclear (use human-in-the-loop tool)

- Use web search and Context7 MCP if necessary

- Whenever modifying or changing a feature, design it before implementation.

- Strategic use of the `serena_mcp` command for token efficient and structured problem solving. Create applications, components, APIs, systems and tests with maximum efficiency.

- Think in English, answer in Japanese.

### Development Principles

1. **YAGNI**: Do not implement features that may not be used in the future.
2. **DRY**: Always make duplicated code into functions or modules.
3. **KISS**: Prefer simple solutions to complex solutions
4. Do not do anything other than what you are told to do, and do not implement anything unnecessary.

### Work Reporting Rules

Upon completion of the work, a numbered list of work items performed shall be reported in the following format.

```

---

作業完了報告:



1. [実施した作業項目1]

2. [実施した作業項目2]

3. [実施した作業項目3]

...

---



```

### Code Review Rules

When a request for code review is made, the review must be conducted in Japanese.
