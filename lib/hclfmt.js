'use babel';

import { CompositeDisposable, BufferedProcess } from 'atom';

export default {
    config: {
        fmtOnSave: {
            type: 'boolean',
            default: true,
            title: 'Format on save'
        },
        binPath: {
            type: 'string',
            default: 'hclfmt',
            title: 'Path to the hclfmt executable'
        },
        extensions: {
            type: 'array',
            default: ['.hcl', '.tf', '.nomad'],
            title: 'Extension to auto-format '
        }
    },

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
            this.subscriptions.add(textEditor.onDidSave((event) => {
                if (!this.grammarInScope(textEditor.getGrammar().fileTypes)) return;
                if (!atom.config.get('hclfmt.fmtOnSave')) return;
                this.format(event.path);
            }));
        }));

        this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="hcl"]', 'hclfmt:format', () => {
            let textEditor = atom.workspace.getActiveTextEditor();
            if (!this.grammarInScope(textEditor.getGrammar().fileTypes)) return;
            textEditor.save();
            if (!atom.config.get('hclfmt.fmtOnSave')) {
                this.format(textEditor.getPath());
            }
        }));
    },

    grammarInScope(fileTypes) {
        for (let t of fileTypes) {
            for (let e of atom.config.get('hclfmt.extensions')) {
                if (e.replace(/^\./, '') == t) {
                    return true;
                }
            }
        }
        return false;
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    format(file) {
        new BufferedProcess({command: atom.config.get('hclfmt.binPath'), args: ['-w', file]});
    }

};
