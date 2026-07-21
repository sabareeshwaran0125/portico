const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('e:/portico/frontend/src/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center min-h-\[50vh\]"/g, 'className="flex items-center justify-center min-h-[50vh] w-full"');
  content = content.replace(/className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-background min-h-\[calc\(100vh-64px\)\]"/g, 'className="w-full"');
  content = content.replace(/className="flex-1 overflow-y-auto p-4 md:p-8"/g, 'className="w-full"');
  content = content.replace(/className="p-4 md:p-8 max-w-container-max mx-auto w-full"/g, 'className="w-full"');
  content = content.replace(/className="flex flex-col gap-6 w-full max-w-container-max mx-auto p-4 md:p-8"/g, 'className="flex flex-col gap-6 w-full"');
  content = content.replace(/className="max-w-container-max mx-auto p-4 md:p-8"/g, 'className="w-full"');
  content = content.replace(/className="flex items-center justify-center min-h-\[calc\(100vh-140px\)\] p-4 md:p-8"/g, 'className="flex items-center justify-center min-h-[60vh]"');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
