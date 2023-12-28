// "use client";
import { Grid, Col, Card, Text, AreaChart, Metric } from "@tremor/react";
// import UsageAnalysis from "./usage-analysis";
import UsageByModel from "./usage-by-model";

export default function AdminPage() {
  return (
    <>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-2">
        <Col numColSpan={1} numColSpanLg={1}>
          {/*<UsageAnalysis />*/}
          {/*<Card></Card>*/}
        </Col>
        <Col numColSpan={1} numColSpanLg={2}>
          <UsageByModel />
        </Col>
      </Grid>
    </>
  );
}