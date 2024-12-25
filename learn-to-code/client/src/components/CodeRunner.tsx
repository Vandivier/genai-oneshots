import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

interface CodeRunnerProps {
  initialCode?: string;
  onResult?: (result: any) => void;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({
  initialCode = "",
  onResult,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");

  const runCode = () => {
    try {
      // Create a safe environment for code execution
      const sandbox = new Function(
        "console",
        `
        try {
          ${code}
        } catch (error) {
          return { error: error.message };
        }
      `
      );

      // Capture console.log output
      let logs: string[] = [];
      const fakeConsole = {
        log: (...args: any[]) => {
          logs.push(args.map((arg) => String(arg)).join(" "));
        },
      };

      sandbox(fakeConsole);
      setOutput(logs.join("\n"));
      onResult?.(logs);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      onResult?.({ error: error.message });
    }
  };

  return (
    <div className="code-runner">
      <CodeMirror
        value={code}
        height="200px"
        extensions={[javascript()]}
        onChange={(value) => setCode(value)}
      />
      <button onClick={runCode}>Run Code</button>
      <div className="output">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeRunner;
