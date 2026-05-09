import { Plugin } from 'obsidian';
import { Extension } from '@codemirror/state';
import { ArrowsSettingTab, ArrowsPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { arrowsViewPlugin, refreshAllArrows } from "./arrowsViewPlugin";
import { getArrowsConfigExtension, reconfigureArrowsConfig } from './arrowsConfig';
import { iterateCM6 } from './utils';

export default class ArrowsPlugin extends Plugin {
	settings: ArrowsPluginSettings;
	extensions: Extension[];
	userDefinedColorsDict: {[colorName: string]: string};

	private arrowStarted = false;
	private currArrowName = "";

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ArrowsSettingTab(this.app, this));

		this.extensions = [
			getArrowsConfigExtension(this.settings),
			arrowsViewPlugin.extension
		];
		this.registerEditorExtension(this.extensions);

		this.addCommand({
			id: 'insert-arrow-at-cursor',
			name: 'Insert arrow at cursor location',
			editorCallback: (editor) => {
				let arrowString = this.arrowInsertConstructor()
				const cursor = editor.getCursor();
				editor.replaceRange(arrowString, cursor);
			}
		});
	}

	onunload() {
		const leaderLineDefs = document.getElementById("leader-line-defs");
		if (leaderLineDefs) leaderLineDefs.remove();
	}
	
	arrowInsertConstructor() {
		if (this.arrowStarted == false){
			const randColor = this.getRandomPastel();
			const currTimestamp = Date.now().toString();
			this.arrowStarted = true
			this.currArrowName = currTimestamp
			
			return `{${currTimestamp}|${randColor}}`;
		} else {
			this.arrowStarted = false
			return `{${this.currArrowName}}`;
		}

	}

	getRandomPastel(): string {
		const softColors = [
			"#6f8fae",
			"#7b6fae",
			"#6faea3",
			"#aea36f",
			"#ae7f6f",
			"#6fae7f",
			"#6f9fae",
			"#a06fae",
			"#9fae6f",
			"#ae8f6f",
			"#6f87ae",
			"#8f8f8f"  
		];

		return softColors[
			Math.floor(Math.random() * softColors.length)
		];
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	reconfigureArrowsConfig() {
		iterateCM6(this.app.workspace, (view) => {
			view.dispatch({
				effects: reconfigureArrowsConfig(this.settings)
			});
		})
	}

	reloadArrowsViewPlugin() {
		iterateCM6(this.app.workspace, (view) => {
			view.dispatch({
				effects: refreshAllArrows.of(null)
			});
		})
	}
}
