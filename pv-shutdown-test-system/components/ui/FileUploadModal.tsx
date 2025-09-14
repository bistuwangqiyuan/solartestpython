'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  data: {
    headers: string[]
    data: any[]
    metadata?: any
  }
  uploading: boolean
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  uploading,
}: FileUploadModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-dark-900 p-6 text-left align-middle shadow-xl transition-all border border-dark-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white flex items-center"
                >
                  <CloudArrowUpIcon className="h-6 w-6 mr-2 text-primary-500" />
                  保存数据到数据库
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    即将保存以下数据到数据库：
                  </p>
                  
                  <div className="mt-4 space-y-2 bg-dark-800 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">数据行数</span>
                      <span className="text-gray-300">{data.data.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">列数</span>
                      <span className="text-gray-300">{data.headers.length}</span>
                    </div>
                    {data.metadata?.recordTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">记录时间</span>
                        <span className="text-gray-300">{data.metadata.recordTime}</span>
                      </div>
                    )}
                    {data.metadata?.deviceAddress && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">设备地址</span>
                        <span className="text-gray-300">{data.metadata.deviceAddress}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-4 text-sm text-yellow-500">
                    注意：数据将创建为新的实验记录
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-800 hover:bg-dark-700 rounded-md transition-colors"
                    onClick={onClose}
                    disabled={uploading}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
                    onClick={onConfirm}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </span>
                    ) : (
                      '确认保存'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}