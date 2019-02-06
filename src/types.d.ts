// ServiceWorker

interface SW_MESSAGE
{
	type: string,
	status?: boolean,
	message?: string,
}

interface SW_MESSAGE_CACHE extends SW_MESSAGE
{
	success: number,
	failure: number,
}
