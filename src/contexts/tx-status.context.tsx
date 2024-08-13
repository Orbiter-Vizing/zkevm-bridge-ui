import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Id } from "react-toastify";

// import { FormData } from "src/domain";

// interface FormContext {
//   formData?: FormData;
//   setFormData: (formData?: FormData) => void;
// }
interface TxStatusContext {
  setTxQueue: (txQueue: TxStatus[]) => void;
  txQueue: TxStatus[];
}

export interface TxStatus {
  hash: string;
  toastId: Id;
}

// const formContextDefaultValue: FormContext = {
//   setFormData: () => {
//     console.error("The form context is not yet ready");
//   },
// };
const txStatusContextDefaultValue: TxStatusContext = {
  // setTxQueue: (txQueue: string[]) => [...txQueue],
  setTxQueue: () => {
    console.error("The txQueue context is not yet ready");
  },
  txQueue: [],
};

// const formContext = createContext<FormContext>(formContextDefaultValue);
const txStatusContext = createContext<TxStatusContext>(txStatusContextDefaultValue);
// const txStatusContext = createContext({});

// const FormProvider: FC<PropsWithChildren> = (props) => {
//   const [formData, setFormData] = useState<FormData>();

//   const value = useMemo(() => {
//     return { formData, setFormData };
//   }, [formData]);

//   return <formContext.Provider value={value} {...props} />;
// };
const TxStatusProvider: FC<PropsWithChildren> = (props) => {
  const [txQueue, setTxQueue] = useState<TxStatus[]>([]);

  // const debugSetTxQueue = (newQueue: string[]) => {
  //   console.log("setTxQueue is called with:", newQueue);
  //   setTxQueue(newQueue);
  // };

  const value = useMemo(() => {
    return { setTxQueue, txQueue };
  }, [txQueue]);
  // const value = () => {
  //   return { setTxQueue: debugSetTxQueue, txQueue };
  // };

  return <txStatusContext.Provider value={value} {...props} />;
};

const useTxStatusContext = (): TxStatusContext => {
  return useContext(txStatusContext);
};

export { TxStatusProvider, useTxStatusContext };
