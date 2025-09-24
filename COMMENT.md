# Project Commands and Troubleshooting

This file provides a list of commands to set up and run the project, along with solutions to common errors you might encounter.

## Setup

First, you need to install all the project dependencies using `pnpm`. This command will also automatically generate the necessary protobuf files and install the Playwright browser binaries.

```bash
pnpm install
```

## Running the Application

To start the frontend and backend servers, run the following script from the root of the project:

```bash
./run.sh
```

## Troubleshooting

Here are solutions to some common issues you might face:

### 1. Permission Error with `run.sh`

If you see a "Permission denied" error when trying to execute `./run.sh`, you need to make the script executable.

**Solution:**

Run the following command to grant execute permissions:

```bash
chmod +x run.sh
```

### 2. Playwright Browser Not Found

If the application fails with an error like "Executable doesn't exist," it means the Playwright browser binaries are missing. The `postinstall` script should handle this, but you can run the installation manually if needed.

**Solution:**

Run the following command from the root of the project to install the browsers for the `backend` service:

```bash
pnpm --filter backend exec playwright install --with-deps
```

### 3. TypeScript Import Errors

If you see errors like "Cannot find module './module.js' or its corresponding type declarations," it's likely due to how TypeScript is configured for ES modules.

**Solution:**

Ensure that all relative imports in your TypeScript files end with the `.js` extension. This is required when using `moduleResolution: "NodeNext"` in your `tsconfig.json`.

**Example:**

```typescript
// Incorrect
import { MyModule } from './my-module';

// Correct
import { MyModule } from './my-module.js';
```
