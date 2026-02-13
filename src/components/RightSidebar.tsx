"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X as CloseIcon } from "lucide-react";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function RightSidebar({
  isOpen,
  onClose,
  title,
  description,
  children,
}: RightSidebarProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-[60%]">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl">
                    <div className="px-8 py-8 sm:px-12 border-b border-gray-50 bg-white sticky top-0 z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-2xl font-serif text-[#2C2C2C]">
                            {title}
                          </Dialog.Title>
                          {description && (
                            <p className="mt-1 text-sm text-gray-400 font-medium">
                              {description}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-full bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-50 p-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <CloseIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-8 py-8 sm:px-12">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
