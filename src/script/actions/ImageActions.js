import dispatcher from "../dispatcher";

export function createImage(title, url){
	dispatcher.dispatch({
		type: "CREATE",
		title,
		url
	});
}
