import { FC } from "react";

interface Props {}

export const ChatLoaderV2: FC<Props> = () => {
  return (
    <div className="flex flex-col flex-start">
      <div
        className={`flex items-center  text-neutral-900 rounded-2xl px-4 py-2 w-fit`}
        style={{ overflowWrap: "anywhere" }}
      >
            <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >载入...</span>
            </div>
      </div>
    </div>
  );
};
