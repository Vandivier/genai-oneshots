import * as fs from "fs";
import * as path from "path";

const targetDir = path.join(__dirname, "..", "wizard-dude"); // Path to wizard-dude directory

function printFolderStructure(dirPath: string, indent: string = "") {
  const items = fs.readdirSync(dirPath);

  for (let i = 0; i < items.length; i++) {
    const itemName = items[i];
    const itemPath = path.join(dirPath, itemName);
    const isDirectory = fs.statSync(itemPath).isDirectory();
    const isLastItem = i === items.length - 1;

    const treeMarker = isLastItem ? "└── " : "├── ";
    console.log(indent + treeMarker + itemName);

    if (isDirectory) {
      const newIndent = indent + (isLastItem ? "    " : "│   ");
      printFolderStructure(itemPath, newIndent);
    }
  }
}

console.log("Folder structure of wizard-dude/:");
printFolderStructure(targetDir);
