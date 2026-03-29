import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Layers, Leaf, ShieldCheck, FlaskConical, X } from 'lucide-react';
import { getDiseaseDetailById, getHistoryImageUrl } from '../../data/DiseaseDictionary';

interface DiseaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diseaseId: string | null;
  historyId?: string | null;
  imageUrlOverride?: string | null;
}

export const DiseaseDetailDrawer = ({
  isOpen,
  onClose,
  diseaseId,
  historyId = null,
  imageUrlOverride = null,
}: DiseaseDetailDrawerProps) => {
  const disease = getDiseaseDetailById(diseaseId);
  const historyImageUrl = getHistoryImageUrl(historyId);
  const displayImageUrl = historyImageUrl || imageUrlOverride || disease?.imageUrl || null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="border-b border-gray-100 px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <Dialog.Title className="pr-2 text-base font-semibold text-gray-900 sm:text-lg">
                          {disease?.nameVN || 'Không tìm thấy thông tin bệnh'}
                        </Dialog.Title>
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          aria-label="Đóng"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {!disease ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 shadow-sm">
                          Không có dữ liệu chi tiết cho bệnh này. Vui lòng kiểm tra lại kết quả nhận diện hoặc thử lại với ảnh rõ hơn.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {displayImageUrl ? (
                            <img
                              src={displayImageUrl}
                              alt={disease.nameVN}
                              className="h-52 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-52 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                              Chưa có ảnh phân tích cho bản ghi này.
                            </div>
                          )}

                          <section className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-900">Tổng quan</h3>
                            <div className="space-y-3">
                              <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
                                <div className="mb-1 flex items-center gap-2 text-green-700">
                                  <Leaf className="h-4 w-4" />
                                  <p className="text-sm font-medium">Tình trạng lá</p>
                                </div>
                                <p className="text-sm leading-6 text-gray-700">{disease.leafCondition}</p>
                              </div>
                              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
                                <div className="mb-1 flex items-center gap-2 text-amber-700">
                                  <Layers className="h-4 w-4" />
                                  <p className="text-sm font-medium">Tình trạng đất liên đới</p>
                                </div>
                                <p className="text-sm leading-6 text-gray-700">{disease.soilCondition}</p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-900">Chi tiết bệnh</h3>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                              <p className="mb-1 text-sm font-medium text-gray-900">Triệu chứng</p>
                              <p className="text-sm leading-6 text-gray-700">{disease.symptoms}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                              <p className="mb-1 text-sm font-medium text-gray-900">Nguyên nhân</p>
                              <p className="text-sm leading-6 text-gray-700">{disease.causes}</p>
                            </div>
                          </section>

                          <section className="space-y-3">
                            <h3 className="text-base font-semibold text-gray-900">Biện pháp kiểm soát</h3>
                            <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
                              <div className="mb-1 flex items-center gap-2 text-green-700">
                                <ShieldCheck className="h-4 w-4" />
                                <p className="text-sm font-medium">Kiểm soát canh tác</p>
                              </div>
                              <p className="text-sm leading-6 text-gray-700">{disease.management.cultural}</p>
                            </div>
                            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
                              <div className="mb-1 flex items-center gap-2 text-orange-700">
                                <FlaskConical className="h-4 w-4" />
                                <p className="text-sm font-medium">Kiểm soát hóa học</p>
                              </div>
                              <p className="text-sm leading-6 text-gray-700">{disease.management.chemical}</p>
                            </div>
                          </section>
                        </div>
                      )}
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
};
