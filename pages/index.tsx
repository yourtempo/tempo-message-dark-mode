import React from "react";
import { Email } from "../components/email";
import { emails } from "../test-emails";

const renderEmails = Object.entries(emails);

const Index: React.FC = () => {
  return (
    <div className="emails">
      {renderEmails.map(([name, body]) => (
        <Email key={name} name={name} body={body} />
      ))}

      <div className="margin" />

      <style jsx>{`
        .emails {
          display: flex;
          position: relative;
          overflow-x: auto;
          gap: 1rem;
          padding: 2rem;
          box-sizing: border-box;
          height: 100%;
        }

        .margin {
          min-width: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Index;
