import Head from "next/head";
import { Box, Container, Grid } from "@mui/material";
import { CampaignCard } from "../components/dashboard/campaign-card";
import { LatestOrders } from "../components/dashboard/latest-orders";
import { LatestProducts } from "../components/dashboard/latest-products";
import { Sales } from "../components/dashboard/sales";
import { TasksProgress } from "../components/dashboard/tasks-progress";
import { TotalCustomers } from "../components/dashboard/total-customers";
import { TotalProfit } from "../components/dashboard/total-profit";
import { TrafficByDevice } from "../components/dashboard/traffic-by-device";
import { DashboardLayout } from "../components/dashboard-layout";
import { NewCampaign } from "src/components/dashboard/new-campaign";
import campaignFactory from "../eth/scripts/campaignFactory";
import React, { useState, useEffect, Fragment } from "react";
import web3 from "src/eth/scripts/web3";
import { useRouter } from "next/router";
import Link from "next/link";
import Campaign from "src/eth/scripts/campaign";

function Dashboard(props) {
  // console.log("props", props);
  const router = useRouter();
  // console.log("loc", props, router);
  const [data, setData] = useState([]);

  const [accounts, setAccounts] = useState(null);
  const [deployedCampaigns, setDeployedCampaign] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const accounts = await web3.eth.getAccounts();
      const deployedCampaignAddress = await campaignFactory.methods.getDeployedCampaign().call();

      let campaigns = [];
      deployedCampaignAddress.forEach(async (address, i) => {
        const campaign = Campaign(address);

        let summary = await campaign.methods.getSummary().call();
        let campaignData = {
          address: address,
          name: summary[0],
          description: summary[1],
          minimunContribution: summary[2],
          balance: summary[3],
          requestsCount: summary[4],
          approversCount: summary[5],
          manager: summary[6],
        };
        campaigns.push(campaignData);
        if (deployedCampaignAddress.length == campaigns.length) {
          // console.log("completed");
          setDeployedCampaign(campaigns);
        }
      });
      setAccounts(accounts);

      campaignFactory.events
        .NewCampaign({})
        .on("data", newCampaignEvent)
        .on("error", (error) => console.log("evnt err", error));
    })();
  }, [router]);

  function newCampaignEvent(e) {
    const { _name, _description, _minumum, _owner } = e.returnValues;
    console.log("evt", _name, _description, _minumum, _owner);
  }
  const onSubmit = async (e, values) => {
    e.preventDefault();
    // console.log("min", values);
    const { name, description, minContribution } = values;
    setLoading(true);

    try {
      await campaignFactory.methods
        .createCampaign(name, description, minContribution)
        .send({
          from: accounts[0],
        })
        .then(async (tx) => {
          let deployedCampaignAddress = await campaignFactory.methods.getDeployedCampaign().call();
          let newCampaignData = {
            address: deployedCampaignAddress[deployedCampaignAddress.length - 1],
            name: name,
            description: description,
            minimunContribution: minContribution,
            balance: 0,
            requestsCount: 0,
            approversCount: 0,
            manager: accounts[0],
          };
          setDeployedCampaign([newCampaignData, ...deployedCampaigns]);
          setLoading(false);
        });
    } catch (error) {
      console.log("new camp err", error);
      setLoading(false);
    }
  };
  console.log("data", data);
  return (
    <>
      <Head>
        <title>Dashboard </title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item lg={12} sm={12} xl={12} xs={12}>
              <NewCampaign title="Create New Campaign" onSubmit={onSubmit} loading={loading} />
            </Grid>
            {deployedCampaigns?.map((campaign, i) => {
              return (
                <React.Fragment key={i}>
                  <Grid item lg={12} sm={12} xl={12} xs={12}>
                    <Link
                      href={{
                        pathname: "/campaign/[showcampaign]",
                        query: { showcampaign: campaign.address },
                      }}
                      passHref
                    >
                      <CampaignCard campaign={campaign} i={i + 1} />
                    </Link>
                  </Grid>
                </React.Fragment>
              );
            })}

            {/* <Grid item xl={3} lg={3} sm={6} xs={12}>
              <TotalCustomers />
            </Grid>
            <Grid item xl={3} lg={3} sm={6} xs={12}>
              <TasksProgress />
            </Grid>
            <Grid item xl={3} lg={3} sm={6} xs={12}>
              <TotalProfit sx={{ height: "100%" }} />
            </Grid>
            <Grid item lg={8} md={12} xl={9} xs={12}>
              <Sales />
            </Grid>
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <TrafficByDevice sx={{ height: "100%" }} />
            </Grid>
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <LatestProducts sx={{ height: "100%" }} />
            </Grid>
            <Grid item lg={12} md={12} xl={9} xs={12}>
              <LatestOrders />
            </Grid> */}
          </Grid>
        </Container>
      </Box>
    </>
  );
}

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
