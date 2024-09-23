import React, { useCallback, useMemo, useState } from "react";
import { callInfraAPI } from "./config/infra";

import "./App.css";
import { IMessage } from "./models";
import { Avatar, Button, Col, Input, List, Row } from "antd";

const App: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [messages, setMessageList] = useState<Array<IMessage>>([
    {
      role: "assistant",
      content: "Be a helpful assistant",
    },
  ]);

  const handleUpdateMessage = useCallback(
    (messages: Array<IMessage>, chunk: IMessage) => {
      const preMessageList = [...messages];

      const message = {
        role: "assistant",
        content: chunk.content,
      } as IMessage;

      const lastMessage = preMessageList[preMessageList.length - 1];
      if (lastMessage.role === "user") {
        preMessageList.push(message);
        return preMessageList;
      } else {
        lastMessage.content += chunk.content;
        return preMessageList;
      }
    },
    []
  );

  const handleSearch = async (search: string) => {
    const _messages: Array<IMessage> = [
      ...messages,
      {
        role: "user",
        content: search,
      },
    ];

    setMessageList(_messages);
    await callInfraAPI(_messages, (chunk) =>
      setMessageList((prev) => handleUpdateMessage(prev, chunk))
    );
  };

  const renderMessageList = useMemo(() => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={messages
          .map((m) => {
            return {
              title: m.role,
              description: m.content,
            };
          })
          .reverse()}
        renderItem={(item) => {
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={
                      item.title === "assistant"
                        ? `https://api.dicebear.com/9.x/bottts/svg?seed=Felix`
                        : `https://api.dicebear.com/9.x/notionists/svg?seed=Felix`
                    }
                  />
                }
                title={item.title}
                description={item.description}
              />
            </List.Item>
          );
        }}
      />
    );
  }, [messages]);

  const handleSubmit = () => {
    if (search === "") {
      return;
    }
    handleSearch(search);
    setSearch("");
  };

  return (
    <main>
      <Row>
        <Input.TextArea
          value={search}
          placeholder="Enter your question"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <Col style={{ marginTop: "12px" }}>
          <Button onClick={() => handleSubmit()} type="primary">
            Submit
          </Button>
        </Col>
      </Row>

      <section style={{ maxHeight: "80dvh", marginTop: 20, overflow: "auto" }}>
        {renderMessageList}
      </section>
    </main>
  );
};

export default App;
