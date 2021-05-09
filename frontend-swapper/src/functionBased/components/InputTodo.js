import React, { useEffect, useState } from "react"
import { FaPlusCircle } from "react-icons/fa";
const axios = require('axios');

const InputTodo = (props) => {
	// const { data, error, isLoading } = useAsync({ promiseFn: loadUsers })
	const [inputText, setInputText] = useState({
		title: "",
	})

	const onChange = e => {
		setInputText({
			...inputText,
			[e.target.name]: e.target.value,
		})
	}

	const [data, dataSet] = useState(null);
	let x;
	useEffect(() => {
		let d = [];
		async function fetchMyAPI() {
			let response = await axios.get('https://api.1inch.exchange/v3.0/1/tokens');
			response = response.data.tokens;
			for (const key in response) {
				d.push({ name: response[key]['name'], address: response[key]['address'] });
			}
			console.log(d);
			// dataSet(d);
		}
		x = (<option value="2">XXX</option>);
		dataSet(x);
		fetchMyAPI();
	}, [])

	const handleSubmit = e => {
		e.preventDefault();
		if (inputText.title.trim()) {
			props.addTodoProps(inputText.title);
			setInputText({
				title: "",
			})
		} else {
			alert("Please write item")
		}
	};

	return (
		<form onSubmit={handleSubmit} className="form-container">
			{data ? "" : "loading"}
			<select
				className="input-text"
				name="title"
				onChange={onChange}
			>
				{data}
				<option value="">tokens</option>
			</select>
			<button className="input-submit">
				<FaPlusCircle style={{ color: "darkcyan", fontSize: "20px", marginTop: "2px" }} />
			</button>
		</form>
	)
}

export default InputTodo
