import React from 'react'
import AddNewFolder from './AddNewFolder'
import storeActions from '../stores/StoreActions'
import { getStore } from '../stores/LauncherStore'
const { MY_APPS, DASHBOARDS, FAVORITES } = storeActions.getConstants();
import {
	FinsembleDraggable, FinsembleDialog,
	FinsembleDnDContext,
	FinsembleDroppable
} from '@chartiq/finsemble-react-controls'

const dragDisabled = storeActions.getDragDisabled()

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			foldersList: storeActions.getFoldersList(),
			activeFolder: storeActions.getActiveFolderName(),
			renamingFolder: null,
			folderNameInput: '',
			isNameError: false
		}
		this.renameFolder = this.renameFolder.bind(this)
		this.changeFolderName = this.changeFolderName.bind(this)
		this.onFoldersListUpdate = this.onFoldersListUpdate.bind(this)
		this.keyPressed = this.keyPressed.bind(this)
		this.deleteFolder = this.deleteFolder.bind(this)
		this.onFocusRemove = this.onFocusRemove.bind(this)
		this.onDragEnd = this.onDragEnd.bind(this);
	}

	onDragEnd(event = {}) {
		if (!event.destination) return;
		//There are two items above the 0th item in the list. They aren't reorderable. We add 2 to the index so that it matches with reality. The source comes in properly but the destination needs to be offset.
		let newIndex = event.destination.index;

		storeActions.reorderFolders(event.source.index, newIndex);

	}
	onAppDrop(event, folder) {
		event.preventDefault()
		const app = JSON.parse(event.dataTransfer.getData('app'))
		// Do not do anything if its my apps or dashboards folder
		if ([MY_APPS, DASHBOARDS].indexOf(folder) < 0) {
			storeActions.addAppToFolder(folder, app);
			if (folder === FAVORITES) {
				//If favorites, then also pin
				storeActions.addPin(app);
			}
		}
	}

	onFoldersListUpdate(error, data) {
		this.setState({
			foldersList: data.value
		})
	}

	onFolderClicked(event, folder) {
		getStore().setValue({
			field: 'activeFolder',
			value: folder
		}, (error, data) => {
			this.setState({
				activeFolder: folder
			})
		})
	}

	onFocusRemove(event) {
		// We don't want to hide the input if user clicked on it
		// We only hide when the click is anywhere else in the document
		if (event.target.id === 'rename') {
			return
		}
		// If focus removed and nothing was type, then just hide
		// and consider it a rename cancel
		if (!this.state.folderNameInput) {
			// Cancel rename
			this.setState({
				renamingFolder: null
			})
			this.removeClickListener()
			return
		}
		//Finally, all good and so we can rename the folder
		this.attempRename()
	}

	componentWillMount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	componentWillUnmount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	renameFolder(name, e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			renamingFolder: name
		})
		this.addClickListener()
	}

	changeFolderName(e) {
		this.setState({
			folderNameInput: e.target.value
		});
	}

	deleteFolder(name, e) {
		e.stopPropagation();
		e.preventDefault();
		// Do not attemp to delete if user is renaming a folder
		!this.state.renamingFolder && storeActions.deleteFolder(name)
	}

	keyPressed(e) {
		if (e.key === "Enter") {
			this.attempRename()
		}
	}

	addClickListener() {
		document.addEventListener('click', this.onFocusRemove)
	}

	removeClickListener() {
		document.removeEventListener('click', this.onFocusRemove)
	}
	/**
	 * To be called when user press Enter or when focus is removed
	 */
	attempRename() {
		const folders = storeActions.getFolders()
		const input = this.state.folderNameInput.trim()
		const oldName = this.state.renamingFolder;
		let newName = input;
		// Check user input to make sure its at least 1 character
		// made of string, number or both
		if (!/^([a-zA-Z0-9\s]{1,})$/.test(input)) {
			// Do not rename
			console.warn('A valid folder name is required. /^([a-zA-Z0-9\s]{1,})$/')
			return this.setState({
				isNameError: true
			});
		}
		// Names must be unique, folders cant share same names
		if (folders[newName]) {
			let repeatedFolderIndex = 0;
			do {
				repeatedFolderIndex++;
			} while (Object.keys(folders).includes(newName + "(" + repeatedFolderIndex + ")"));
			newName = newName + `(${repeatedFolderIndex})`;
		}

		this.setState({
			folderNameInput: "",
			renamingFolder: null,
			isNameError: false
		}, () => {
			storeActions.renameFolder(oldName, newName)
			// No need for the click listener any more
			this.removeClickListener()
		})
	}

	/**
	 * Given some data, renders the basic folder structure that cannot be unordered. Used for orderable folders too. Those just get wrapped in a Draggable
	 * @param {*} folder
	 * @param {*} folderName
	 * @param {*} index
	 */
	renderFolder(folder, folderName, index) {
		let className = 'complex-menu-section-toggle'
		if (this.state.activeFolder === folderName) {
			className += ' active-section-toggle'
		}

		let nameField = folder.icon === 'ff-folder' && this.state.renamingFolder === folderName ?
			<input id="rename" value={this.state.folderNameInput}
				onChange={this.changeFolderName}
				onKeyPress={this.keyPressed} className={this.state.isNameError ? "error" : ""} autoFocus /> : folderName;

		//This DOM will be rendered within a draggable (if the folder can be dragged), and a plain ol div if it cannot be dragged.
		return (
			<div onClick={(event) => this.onFolderClicked(event, folderName)}
				onDrop={(event) => this.onAppDrop(event, folderName)}
				className={className} key={index}>
				<div className='left-nav-label'>
					{folder.icon && <i className={folder.icon}></i>}
					<div className="folder-name">{nameField}</div>
				</div>
				{folder.icon === 'ff-folder' && <span className='folder-action-icons'>
					<i className='ff-edit' onClick={this.renameFolder.bind(this, folderName)}></i>
					<i className='ff-delete' onClick={this.deleteFolder.bind(this, folderName)}></i>
				</span>}
			</div>);
	}
	/**
	 * Render all folders that cannot be reordered.
	 */
	renderUnorderableFolders() {
		let unorderableFolders = this.state.foldersList.filter(folderName => dragDisabled.includes(folderName));
		const folders = storeActions.getFolders()
		return unorderableFolders.map((folderName, index) => {
			const folder = folders[folderName]
			return this.renderFolder(folder, folderName, index)
		})
	}

	/**
	 * Renders all folders that can be reordered (user created folders).
	 */
	renderOrderableFolders() {
		let orderableFolders = this.state.foldersList.filter(folderName => !dragDisabled.includes(folderName));
		const folders = storeActions.getFolders()
		return orderableFolders.map((folderName, index) => {
			const folder = folders[folderName]
			return (<FinsembleDraggable
				draggableId={folderName}
				key={index} index={index}>
				{this.renderFolder(folder, folderName, index)}
			</FinsembleDraggable>);
		})
	}

	render() {
		return (
			<div className="top">
				<div className='folder-list'>
					{this.renderUnorderableFolders()}
					<FinsembleDnDContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
						<FinsembleDroppable direction="vertical" droppableId="folderList">
							{this.renderOrderableFolders()}
						</FinsembleDroppable>
					</FinsembleDnDContext>
				</div>
				<AddNewFolder />
			</div>
		)
	}
}