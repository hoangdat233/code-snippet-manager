import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Команда открытия менеджера фрагментов
    const openSnippetManagerCommand = vscode.commands.registerCommand('extension.openSnippetManager', async () => {
        const snippets = await loadSnippets();
        const selectedSnippet = await vscode.window.showQuickPick(snippets, {
            placeHolder: 'Choose a snippet to insert',
        });

        if (selectedSnippet) {
            insertSnippet(selectedSnippet);
        }
    });

    // Команда добавления фрагмента из контекстного меню
    const addSnippetFromContextMenuCommand = vscode.commands.registerCommand('extension.addSnippetFromContextMenu', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText) {
                vscode.window.showErrorMessage('No code selected! Please select code to add as a snippet.');
                return;
            }

            const snippetName = await vscode.window.showInputBox({
                placeHolder: 'Enter a name for your snippet',
            });

            if (snippetName) {
                await addSnippet(snippetName, selectedText);
                vscode.window.showInformationMessage(`Snippet "${snippetName}" added successfully.`);
            } else {
                vscode.window.showErrorMessage('Snippet name cannot be empty!');
            }
        }
    });

    context.subscriptions.push(openSnippetManagerCommand, addSnippetFromContextMenuCommand);
}

export function deactivate() {}

async function loadSnippets(): Promise<string[]> {
    const snippetsPath = path.join(__dirname, '../snippets/cpp.json');
    const fileContent = fs.readFileSync(snippetsPath, 'utf8');
    const snippets = JSON.parse(fileContent);
    return Object.keys(snippets);
}

function insertSnippet(snippet: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const snippetsPath = path.join(__dirname, '../snippets/cpp.json');
        const fileContent = fs.readFileSync(snippetsPath, 'utf8');
        const snippets = JSON.parse(fileContent);

        const snippetBody = snippets[snippet].body;
        editor.insertSnippet(new vscode.SnippetString(snippetBody.join('\n')));
    }
}

async function addSnippet(snippetName: string, snippetBody: string) {
    const snippetsPath = path.join(__dirname, '../snippets/cpp.json');
    const fileContent = fs.readFileSync(snippetsPath, 'utf8');
    const snippets = JSON.parse(fileContent);

    const formattedSnippetBody = snippetBody.split('\n');

    snippets[snippetName] = {
        prefix: snippetName.toLowerCase(),
        body: formattedSnippetBody,
        description: `Custom snippet: ${snippetName}`,
    };

    fs.writeFileSync(snippetsPath, JSON.stringify(snippets, null, 4), 'utf8');
}
