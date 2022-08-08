function Address({ address }) {
  return (
    <div title={address}>
      {address.substring(0, 5)}…{address.substring(address.length - 4)}
    </div>
  );
}

export default Address;
