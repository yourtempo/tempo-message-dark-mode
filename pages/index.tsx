import React from "react";
import { Email } from "../components/email";
import { emails } from "../test-emails";

const renderEmails = Object.entries(emails);

const Index: React.FC = () => {
  return (
    <div className="emails">
      {renderEmails.map(([name, body]) => (
        <Email key={name} body={body} />
      ))}

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

        .emails:last-child:after {
          content: "";
          display: block;
          position: absolute;
          right: -2rem;
          width: 2rem;
          height: 1px;
        }
      `}</style>
    </div>
  );
};

export default Index;
