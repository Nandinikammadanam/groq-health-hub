import { Layout } from "@/components/Layout";
import Dashboard from "./Dashboard";

const Index = () => {
  return (
    <Layout userRole="patient" userName="nandini">
      <Dashboard />
    </Layout>
  );
};

export default Index;
