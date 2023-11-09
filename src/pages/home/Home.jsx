import "./home.scss";

import NavigationBar from "../../components/navigation/NavigationBar";
import Homepage from "../../components/homepage/Homepage";

const Home = () => {
  return (
    <div className="mainCon">
      <NavigationBar />
      <Homepage />
    </div>
  );
};

export default Home;
