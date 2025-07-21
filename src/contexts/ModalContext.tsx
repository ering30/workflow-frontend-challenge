import { createContext, ReactNode, useState } from 'react';

export const ModalContext = createContext(undefined);

type ModalContextProviderProps = {
  children: ReactNode;
};

export const ModalContextProvider = (props: ModalContextProviderProps) => {
  const { children } = props;

  const [modalData, setModalData] = useState({});
  const [showModal, setShowModal] = useState(false);

  const value = {
    modalData,
    showModal,
    setShowModal,
    setModalData,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
