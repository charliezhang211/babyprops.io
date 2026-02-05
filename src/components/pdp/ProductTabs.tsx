/**
 * ProductTabs Component
 *
 * Displays detailed product information in a tabbed interface:
 * - Tab 1: Detailed description
 * - Tab 2: Size & specifications
 * - Tab 3: Care instructions
 * - Tab 4: Shipping information
 *
 * @component
 * @example
 * ```tsx
 * <ProductTabs
 *   description="Full product description..."
 *   specifications={{ dimensions: '45cm diameter', weight: '2kg' }}
 *   careInstructions="Wipe with soft cloth..."
 * />
 * ```
 */

import { useState } from 'react';
import { siteSettings } from '@/config/site-settings';

interface Specification {
  label: string;
  value: string;
}

interface ProductTabsProps {
  description?: string;
  specifications?: Specification[];
  careInstructions?: string;
  customShipping?: string;
}

type TabId = 'description' | 'specifications' | 'care' | 'shipping';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'description', label: 'Description', icon: '📝' },
  { id: 'specifications', label: 'Specifications', icon: '📏' },
  { id: 'care', label: 'Care Instructions', icon: '🧼' },
  { id: 'shipping', label: 'Shipping', icon: '🚚' },
];

export default function ProductTabs({
  description,
  specifications = [],
  careInstructions,
  customShipping,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  return (
    <div className="product-tabs" data-pdp="tabs">
      {/* Tab Navigation */}
      <div className="border-b border-brand-light mb-6">
        <div className="flex flex-wrap gap-2 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-t-lg
                transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-brand-light text-brand-dark border-b-2 border-brand'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-brand-light/50'
                }
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content min-h-[300px]" role="tabpanel">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="prose prose-brand max-w-none">
            {description ? (
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                This premium photography prop is carefully crafted to help you
                create stunning newborn portraits. Each piece is designed with
                both aesthetics and safety in mind, ensuring beautiful results
                for your professional photography sessions.
              </p>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <div className="space-y-4">
            {specifications.length > 0 ? (
              <div className="grid gap-4">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex border-b border-brand-light pb-3"
                  >
                    <span className="text-gray-600 w-1/3">{spec.label}</span>
                    <span className="text-brand-dark font-medium w-2/3">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-700 space-y-4">
                <p>
                  Detailed specifications are displayed on the product
                  information section above.
                </p>
                <div className="bg-brand-light/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-brand-dark mb-2">
                    Standard Features:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-brand mr-2">•</span>
                      <span>Designed for newborn photography (0-3 months)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-brand mr-2">•</span>
                      <span>Premium quality materials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-brand mr-2">•</span>
                      <span>Baby-safe, non-toxic finish</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-brand mr-2">•</span>
                      <span>Suitable for professional use</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Care Instructions Tab */}
        {activeTab === 'care' && (
          <div className="space-y-6">
            {careInstructions ? (
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: careInstructions }}
              />
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-serif text-brand-dark mb-3">
                    Care & Maintenance
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Proper care ensures your photography props remain in
                    pristine condition for years of use.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      🧼
                    </span>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-1">
                        Cleaning
                      </h4>
                      <p className="text-sm text-gray-700">
                        Wipe gently with a soft, dry cloth. For fabric items,
                        spot clean only with mild soap and water. Avoid harsh
                        chemicals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      🌡️
                    </span>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-1">
                        Storage
                      </h4>
                      <p className="text-sm text-gray-700">
                        Store in a cool, dry place away from direct sunlight to
                        prevent fading. Keep away from moisture and humidity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      ⚠️
                    </span>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-1">
                        Safety
                      </h4>
                      <p className="text-sm text-gray-700">
                        Always supervise babies during photo sessions. Props
                        are for photography purposes only and not designed as
                        toys.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      ♻️
                    </span>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-1">
                        Longevity
                      </h4>
                      <p className="text-sm text-gray-700">
                        Handle with care to maintain quality. Avoid excessive
                        bending or pressure on delicate parts.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            {customShipping ? (
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: customShipping }}
              />
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-serif text-brand-dark mb-3">
                    Worldwide Shipping
                  </h3>
                  <p className="text-gray-700">
                    We ship to professional photographers worldwide. All
                    shipments are carefully packaged to ensure your items
                    arrive in perfect condition.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-brand-light/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">
                      <span>🌍</span>
                      <span>Shipping Rates</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex justify-between">
                        <span>Standard (10-15 days)</span>
                        <span className="font-medium">From $9.99</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Express (5-7 days)</span>
                        <span className="font-medium">From $24.99</span>
                      </li>
                      <li className="flex justify-between border-t border-brand-light pt-2">
                        <span className="font-medium text-brand-dark">
                          Free Shipping
                        </span>
                        <span className="font-medium text-brand">
                          Orders $99+
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-brand-light/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">
                      <span>⏱️</span>
                      <span>Processing Time</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-brand mr-2">•</span>
                        <span>In-stock items ship within 3-5 business days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand mr-2">•</span>
                        <span>Handmade items may require 7-10 business days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand mr-2">•</span>
                        <span>Tracking number provided for all orders</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-brand-light pt-6">
                  <h4 className="font-semibold text-brand-dark mb-3">
                    Important Notes
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      📦 All items are carefully inspected and securely packaged
                      before shipping.
                    </p>
                    <p>
                      🌐 Customs fees and import duties may apply for
                      international orders (buyer's responsibility).
                    </p>
                    <p>
                      📞 Questions about shipping? Contact us via{' '}
                      <a
                        href={siteSettings.contact.whatsappUrl}
                        className="text-brand hover:text-brand-dark underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>{' '}
                      or{' '}
                      <a
                        href={`mailto:${siteSettings.contact.email}`}
                        className="text-brand hover:text-brand-dark underline"
                      >
                        email
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
