export default `
	html {
		border: 0;
		margin: 0;
		padding: 0;
	}

	body {
		font-family: -apple-system,
			BlinkMacSystemFont, HelveticaNeue, 'Helvetica Neue', sans-serif, 'Apple Color Emoji';
		font-size: 14px;
		font-weight: normal;
		line-height: 1.5;
		border: 0;
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		-webkit-text-size-adjust: auto;
		word-wrap: break-word;
		-webkit-nbsp-mode: space;
		-webkit-line-break: after-white-space;
		color: #535358 !important;
		display: grid !important; /* this prevents height: 100% styles from hiding elements */
	}

	img:not([width]):not([height]) {
		max-width: 100%;
		height: auto;
	}

	.gmail_quote,
	blockquote {
		border-left: 1px #E9E9F0 solid !important;
		margin-left: 0 !important;
		margin-right: 0 !important;
		padding-right: 0 !important;
		padding-left: 20px !important;
	}
`;
