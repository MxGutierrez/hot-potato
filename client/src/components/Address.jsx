function Address({ address }) {
  return (
    <p title={address}>
      {address.substring(0, 5)}…{address.substring(address.length - 4)}
    </p>
  );
}

export default Address;
