import { Button, Flex, FormControl, IconButton, Input } from "@chakra-ui/react";
import { BiSend } from "react-icons/bi";

export default function BottomBar() {
  const onSubmit = async () => {
    const test = await fetch("/api/gpt", {
      method: "POST",
      body: JSON.stringify({
        question: "Who are you?",
      }),
    });
  };
  return (
    <Flex
      h={"81px"}
      borderTop={"1px solid"}
      borderColor={"gray.600"}
      direction={"row"}
      align={"center"}
    >
      <FormControl p={3} display={"flex"} flexDir={"row"} onSubmit={onSubmit}>
        <Input placeholder="Type a message..." marginEnd={"3"} />
        <IconButton
          onClick={onSubmit}
          type={"submit"}
          aria-label={"send-button"}
          icon={<BiSend />}
        />
      </FormControl>
    </Flex>
  );
}
