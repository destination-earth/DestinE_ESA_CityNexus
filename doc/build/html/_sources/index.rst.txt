.. CITYNEXUS documentation master file, created by
   sphinx-quickstart on Fri May 17 14:14:51 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to CITYNEXUS's documentation!
=====================================

.. toctree::
   :maxdepth: 2
   :caption: Contents:



CityNexus is an innovative **urban digital twin application** designed to assess the **environmental, social, and economic impacts of changes in road networks, mobility, and urban space design**. 

The platform is designed to provide policymakers a **collaborative platform to experiment with various strategies and solutions**, considering diverse factors and variables crucial for successful and sustainable urban interventions, thereby facilitating a coordinated approach to decision-making.

**The service is still under deployment, this is a testing version and no guarantee is given on the accuracy of the results provided.**

CityNexus Platform Overview
---------------------------

The CityNexus platform aims to facilitate evidence-based decision-making at the municipality level by providing capabilities to **evaluate a comprehensive set of Key Performance Indicators (KPIs)** and by implementing an **interactive system for assessing the impact of infrastructural and mobility changes on the target KPIs** through policy-relevant, user-defined 'what-if' scenario simulations.

The five thematic areas addressed are:

- **Mobility Patterns**: CityNexus provides detailed insights into commuting patterns, travel behavior, traffic flows, congestion rates, peak traffic hours, and overall mobility dynamics in the city. This information is crucial for understanding and addressing the challenges of urban transport and traffic management.
- **Air Quality**: The platform evaluates the concentration of various pollutants at ground level, like nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), ozone (O3), black carbon particles, and ultrafine particles. 
- **Dynamic Population Distribution**: CityNexus describes human presence patterns over time, aiding in the understanding of population movements and densities in different city areas.
- **Public Environmental Health**: The platform assesses how air pollution affects public health, including the incidence of diseases associated with exposure to different pollutants.
- **Service Accessibility**: It evaluates the availability, accessibility, and equity of key urban services such as transportation, healthcare, education, workplaces, commercial, and recreational facilities. 

What-If Analysis with CityNexus
-------------------------------

CityNexus offers dedicated functionalities for performing "what if" simulations on 4 scenarios, where users are given the possibility to assess the effects of different types of interventions on the mobility patterns and all other targeted KPIs:

.. image:: images/citynexus_rendering_2.png
   :scale: 30
   :align: right
   :alt: alternate text

1.	**High-speed Road Redesign**: this scenario simulates potential transformation of high-speed road segments into tunnels to reclame the corresponding space for residential areas, green spaces, or recreational/leisure amenities. 
2.	**Electric, Low-Emission Vehicles, and Active Mobility Promotion**: this scenario enables users to customize the proportion of electric and low-emission vehicles within the overall traffic fleet, to promote the adoption of sustainable transportation initiatives and climate-neutrality ambitions.
3.	**Low Emission Zones Creation**: this scenario allows users to convert specific census units, neighborhoods or manually defined areas to LEZ (Low Emission Zones), where motorized circulation is prohibited or limited to specific classes of vehicles;
4.	**Road Speed Adjustment**: this scenario enables adjustments to speed limits for specific road segments or entire categories of roads, to simulate the impact of high traffic speed on air quality and environmental pollution.


User Manual
-----------

Scenario Simulation Parameters:

.. image:: images/citynexus_rendering_3.png
   :scale: 80
   :align: right
   :alt: alternate text

- **Road Segment Conversion**: Modify road segments to be above ground or underground.
- **Average Speed Adjustment**: Change the average speed limit of a specific road segment.
- **Road Segment Accessibility**: Control access to a road segment for all or specific types of traffic.
- **Traffic Composition Weighting**: Alter the proportionate impact of different vehicle types (electric vehicles, bicycles, cars) on total traffic within a segment or area.
- **Point of Interest (POI) Management**: Increase or decrease the number of POIs across various categories within the simulation.
- **Population Dynamics**: Adjust population levels to reflect increases or decreases in the simulated area.

Simulation Running Options:

- **Time Slots**: 8 individually selectable time windows, each representing a 3-hour block.
- **Day Selection**: Option to choose between a weekday or weekend.

Simulation Output:

- **Pollutants Concentration**: 5 different pollutants (CO2, CO, HC, NOx, PMx)
- **Statistics**: (Fuel Consumption, Speed, Congestion, Traffic indiced noise)



Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
