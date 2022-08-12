export default (error) => {
  const parsedError = JSON.parse(
    error.message.substring(error.message.search("{"))
  );
  return Object.values(parsedError.data)[0].reason;
};
