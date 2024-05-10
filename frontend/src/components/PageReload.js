import { useLocation, useParams } from "react-router-dom";
import PrivateChat from "./PrivateChat";

const PageReload = () => {
  const location = useLocation();
  const { id } = useParams();
  const { targetUsername } = location?.state || { targetUsername: "" };

  return <PrivateChat id={id} targetUsername={targetUsername} key={id} />;
};

export default PageReload;
