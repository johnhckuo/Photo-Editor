import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class ImageStore extends EventEmitter{
	constructor(){
		super();
		this.key = 0;
		this.images = [
			{
				id:this.key,
				title: "test",
				date: "2017.1.1",
				URL: ""
			}
		];
	}

	yyyymmdd() {
		var date = new Date();

		var mm = date.getMonth() + 1; // getMonth() is zero-based
		var dd = date.getDate();

		return [date.getFullYear(),
		        (mm>9 ? '' : '0') + mm,
		        (dd>9 ? '' : '0') + dd
		       ].join('.');
	};

	createImage(title, url){
		var id = this.key++;
		this.todos.push({
			id,
			title,
			date: this.yyyymmdd(),
			url
		});
		this.emit("create");
	}

	handleActions(action){
		console.log("action received: ", action);
		switch (action.type){
			case "CREATE":
				this.createImage(action.title, action.url);
				break;
		}
	}
}

const imageStore = new ImageStore;
dispatcher.register(imageStore.handleActions.bind(imageStore));
export default imageStore;
