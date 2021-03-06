import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { useRouter } from "next/router";

const DashboardLayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 280,
  },
}));

export const DashboardLayout = (props) => {
  const router = useRouter();
  // console.log("router", router);
  const { children } = props;
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [accountData, setAccountData] = useState({
    chainName: "Empty",
    isMetamask: false,
    address: "Empty",
  });

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined" && typeof ethereum !== "undefined") {
        console.log("eth", ethereum);
        let chainId = await ethereum.chainId;
        let chainName =
          chainId == "0x1"
            ? "Mainnet"
            : chainId == "0x3"
            ? "Ropsten"
            : chainId == "0x4"
            ? "Rinkeby"
            : "Other";
        let isMetamask = await ethereum.isMetamask;
        let address = await ethereum.selectedAddress;

        console.log(chainId, isMetamask, address);
        ethereum.on("accountsChanged", (accounts) => {
          window.location.reload();
        });

        ethereum.on("chainChanged", (chainId) => {
          window.location.reload();
        });
        let data = { chainName, isMetamask, address };
        setAccountData(data);
        console.log("account data", data, accountData);
      }
    })();
  }, [router.pathname]);

  return (
    <>
      <DashboardLayoutRoot>
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </DashboardLayoutRoot>
      <DashboardNavbar accountData={accountData} onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardSidebar onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
    </>
  );
};
