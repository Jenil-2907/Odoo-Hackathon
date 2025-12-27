function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome 👋</h1>
      <p style={styles.text}>
        This is a demo home page built using React.
      </p>
      <p style={styles.subText}>
        Explore the application using the navigation menu.
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "4rem auto",
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: "10px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#444",
  },
  subText: {
    marginTop: "0.5rem",
    color: "#666",
  },
};

export default Home;
